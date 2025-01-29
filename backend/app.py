from flask import Flask, request, jsonify, session, make_response
from flask_socketio import SocketIO, join_room, leave_room
from pymongo import MongoClient, errors
import bcrypt
from flask_session import Session
import datetime
from flask_cors import CORS

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Flask-Sessionの設定
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = 'supersecretkey'
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = False  # ここをFalseに設定

Session(app)

# CORSの設定
CORS(app, supports_credentials=True)

# MongoDBのクライアントを設定
client = MongoClient('mongodb://localhost:27017/')
db = client.CompSync
user_collection = db.UserTable
company_collection = db.CompanyTable
message_collection = db.ChatMessages

# パスワードをハッシュ化する関数
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# パスワードの検証関数
def check_password(hashed_password, password):
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password)

# ユーザー登録のエンドポイント
@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()

    name = data.get('name')
    birthdate = data.get('birthdate')
    gender = data.get('gender')
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('user_type', 'user')  # デフォルト値として 'user' を設定

    if not all([name, birthdate, gender, email, password, user_type]):
        return jsonify({'error': 'Missing fields'}), 400

    hashed_password = hash_password(password)

    new_user = {
        'name': name,
        'birthdate': birthdate,
        'gender': gender,
        'email': email,
        'password': hashed_password.decode('utf-8'),
        'user_type': user_type
    }

    try:
        user_collection.insert_one(new_user)
        return jsonify({'message': 'User registered successfully'}), 201
    except errors.DuplicateKeyError:
        return jsonify({'error': 'Email already exists'}), 409

# 企業登録のエンドポイント
@app.route('/register_company', methods=['POST'])
def register_company():
    data = request.get_json()

    company_name = data.get('companyName')
    email = data.get('accountEmail')
    password = data.get('accountPassword')
    longitude = data.get('longitude')
    latitude = data.get('latitude')
    altitude = data.get('altitude')
    industries = data.get('industries')
    expertises = data.get('expertises')

    if not all([company_name, email, password, longitude, latitude, altitude, industries, expertises]):
        return jsonify({'error': 'Missing fields'}), 400

    hashed_password = hash_password(password)

    new_user = {
        'name': company_name,  # Using company name for the user name
        'birthdate': '',
        'gender': '',
        'email': email,
        'password': hashed_password.decode('utf-8'),
        'user_type': 'company',
    }

    new_company = {
        'company_name': company_name,
        'coordinates': {
            'longitude': float(longitude),
            'latitude': float(latitude),
            'altitude': float(altitude)
        },
        'industries': industries,
        'expertises': expertises,
        'products_services': [],
        'partner_companies': [],
        'community': '',
        'collaboration_products': [],
        'employees_info': []
    }

    try:
        user_collection.insert_one(new_user)
        company_collection.insert_one(new_company)
        return jsonify({'message': 'Company registered successfully'}), 201
    except errors.DuplicateKeyError:
        return jsonify({'error': 'Company or email already exists'}), 409

# ログインのエンドポイント
@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'error': 'Missing fields'}), 400

    user = user_collection.find_one({'email': email})
    if user and check_password(user['password'], password):
        session['email'] = user['email']

        response = make_response(jsonify({
            'message': 'Login successful',
            'user': {
                'email': user['email'],
                'name': user['name'],
                'user_type': user['user_type']
            }
        }))
        response.set_cookie('email', user['email'], samesite='None', secure=False)  # ここをFalseに設定
        response.set_cookie('name', user['name'], samesite='None', secure=False)  # ここをFalseに設定
        response.set_cookie('user_type', user['user_type'], samesite='None', secure=False)  # ここをFalseに設定
        return response
    else:
        return jsonify({'error': 'Invalid email or password'}), 401

# ログアウトのエンドポイント
@app.route('/logout', methods=['POST'])
def logout_user():
    session.pop('email', None)
    response = make_response(jsonify({'message': 'Logout successful'}))
    return response

# 認証状態を確認するエンドポイント
@app.route('/auth_status', methods=['GET'])
def auth_status():
    email = session.get('email')
    if email:
        user = user_collection.find_one({'email': email}, {'password': 0})
        if user:
            return jsonify({
                'authenticated': True,
                'user': {
                    'email': user['email'],
                    'name': user['name'],
                    'user_type': user['user_type']
                }
            }), 200
    return jsonify({'authenticated': False}), 200

# 認証されたユーザーのみがアクセスできるエンドポイント
@app.route('/users', methods=['GET'])
def get_users():
    if 'email' not in session:
        print('Unauthorized access attempt')  # デバッグ用ログ
        return jsonify({'error': 'Unauthorized'}), 401

    email = session['email']
    print(f'Access attempt by user: {email}')  # デバッグ用ログ

    users = list(user_collection.find({}, {'password': 0}))  # パスワードフィールドを除外
    for user in users:
        user['_id'] = str(user['_id'])  # ObjectIdを文字列に変換

    return jsonify(users), 200

# メッセージ送信のエンドポイント
@app.route('/send_message', methods=['POST'])
def send_message():
    if 'email' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    sender_email = session['email']
    receiver_email = data.get('receiver_email')
    message_text = data.get('message')

    if not all([receiver_email, message_text]):
        return jsonify({'error': 'Missing fields'}), 400

    # 受信者が存在するか確認
    receiver = user_collection.find_one({'email': receiver_email})
    if not receiver:
        return jsonify({'error': 'Receiver not found'}), 404

    message = {
        'sender_email': sender_email,
        'receiver_email': receiver_email,
        'message': message_text,
        'timestamp': datetime.datetime.utcnow()
    }

    message_collection.insert_one(message)
    message['_id'] = str(message['_id'])  # ObjectIdを文字列に変換
    message['timestamp'] = message['timestamp'].isoformat()  # datetimeをISOフォーマットに変換

    socketio.emit('new_message', message, room=receiver_email)
    socketio.emit('new_message', message, room=sender_email)
    return jsonify({'message': 'Message sent successfully'}), 201

# 2者間のメッセージ取得のエンドポイント
@app.route('/get_messages_with', methods=['GET'])
def get_messages_with():
    if 'email' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    user_email = session['email']
    other_email = request.args.get('other_email')

    if not other_email:
        return jsonify({'error': 'Missing other_email parameter'}), 400

    messages = list(message_collection.find({
        '$or': [
            {'sender_email': user_email, 'receiver_email': other_email},
            {'sender_email': other_email, 'receiver_email': user_email}
        ]
    }).sort('timestamp', 1))

    for message in messages:
        message['_id'] = str(message['_id'])
        if 'timestamp' in message:
            message['timestamp'] = message['timestamp'] if isinstance(message['timestamp'], str) else message['timestamp'].isoformat()

    return jsonify(messages), 200

@app.route('/users_with_messages', methods=['GET'])
def get_users_with_messages():
    email = session.get('email')
    if not email:
        return jsonify({'error': 'Unauthorized'}), 401

    user_email = email
    pipeline = [
        {
            '$match': {
                '$or': [
                    {'sender_email': user_email},
                    {'receiver_email': user_email}
                ]
            }
        },
        {
            '$group': {
                '_id': {
                    '$cond': [
                        {'$eq': ['$sender_email', user_email]},
                        '$receiver_email',
                        '$sender_email'
                    ]
                },
                'latest_message': {'$last': '$message'},
                'timestamp': {'$last': '$timestamp'}
            }
        },
        {
            '$lookup': {
                'from': 'UserTable',
                'localField': '_id',
                'foreignField': 'email',
                'as': 'user'
            }
        },
        {
            '$unwind': '$user'
        },
        {
            '$project': {
                '_id': 0,
                'user.email': 1,
                'user.name': 1,
                'latest_message': 1,
                'timestamp': 1
            }
        },
        {
            '$sort': {
                'timestamp': -1
            }
        }
    ]

    messages = list(message_collection.aggregate(pipeline))

    users = [{'email': m['user']['email'], 'name': m['user']['name'], 'latest_message': m['latest_message'], 'timestamp': m['timestamp']} for m in messages]
    return jsonify(users), 200

# ユーザー検索のエンドポイント
@app.route('/search_users', methods=['GET'])
def search_users():
    if 'email' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    search_term = request.args.get('term', '')
    if not search_term:
        return jsonify([]), 200

    search_results = list(user_collection.find({
        'name': {'$regex': search_term, '$options': 'i'}
    }, {'password': 0}))

    for user in search_results:
        user['_id'] = str(user['_id'])  # ObjectIdを文字列に変換

    return jsonify(search_results), 200

@socketio.on('connect')
def handle_connect():
    if 'email' in session:
        join_room(session['email'])

@socketio.on('disconnect')
def handle_disconnect():
    if 'email' in session:
        leave_room(session['email'])

if __name__ == '__main__':
    socketio.run(app, debug=True)
