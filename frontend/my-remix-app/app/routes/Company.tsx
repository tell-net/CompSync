import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Company.css';

const Company: React.FC = () => {
    const [jobTypes, setJobTypes] = useState<string[]>(['']);
    const [skills, setSkills] = useState<string[]>(['']);
    const [formData, setFormData] = useState({
        accountEmail: '',
        accountPassword: '',
        accountPasswordConfirm: '',
        companyName: '',
        longitude: '',
        latitude: '',
        altitude: ''
    });

    const navigate = useNavigate();

    const handleAddJobType = () => {
        setJobTypes([...jobTypes, '']);
    };

    const handleRemoveJobType = (index: number) => {
        const newJobTypes = jobTypes.filter((_, i) => i !== index);
        setJobTypes(newJobTypes);
    };

    const handleJobTypeChange = (index: number, value: string) => {
        const newJobTypes = [...jobTypes];
        newJobTypes[index] = value;
        setJobTypes(newJobTypes);
    };

    const handleAddSkill = () => {
        setSkills([...skills, '']);
    };

    const handleRemoveSkill = (index: number) => {
        const newSkills = skills.filter((_, i) => i !== index);
        setSkills(newSkills);
    };

    const handleSkillChange = (index: number, value: string) => {
        const newSkills = [...skills];
        newSkills[index] = value;
        setSkills(newSkills);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (formData.accountPassword !== formData.accountPasswordConfirm) {
            alert('Passwords do not match');
            return;
        }

        const dataToSend = {
            ...formData,
            industries: jobTypes,
            expertises: skills
        };

        try {
            const response = await fetch('http://localhost:5000/register_company', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                navigate('/login');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className='company-body'>
            <div className="company-container">
                <h1 className="company-title">企業情報登録フォーム</h1>
                <form className="company-form" onSubmit={handleSubmit}>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">アカウント設定</legend>
                        <label className="company-label" htmlFor="account-email">メールアドレス:</label>
                        <input
                            type="email"
                            className="company-input"
                            id="account-email"
                            name="accountEmail"
                            value={formData.accountEmail}
                            onChange={handleInputChange}
                            required
                        />

                        <label className="company-label" htmlFor="account-password">パスワード:</label>
                        <input
                            type="password"
                            className="company-input"
                            id="account-password"
                            name="accountPassword"
                            value={formData.accountPassword}
                            onChange={handleInputChange}
                            required
                        />

                        <label className="company-label" htmlFor="account-password-confirm">パスワード確認:</label>
                        <input
                            type="password"
                            className="company-input"
                            id="account-password-confirm"
                            name="accountPasswordConfirm"
                            value={formData.accountPasswordConfirm}
                            onChange={handleInputChange}
                            required
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">企業情報</legend>
                        <label className="company-label" htmlFor="company-name">企業名:</label>
                        <input
                            type="text"
                            className="company-input"
                            id="company-name"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            required
                        />

                        <label className="company-label" htmlFor="longitude">経度:</label>
                        <input
                            type="text"
                            className="company-input"
                            id="longitude"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleInputChange}
                            required
                        />

                        <label className="company-label" htmlFor="latitude">緯度:</label>
                        <input
                            type="text"
                            className="company-input"
                            id="latitude"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleInputChange}
                            required
                        />

                        <label className="company-label" htmlFor="altitude">高度:</label>
                        <input
                            type="text"
                            className="company-input"
                            id="altitude"
                            name="altitude"
                            value={formData.altitude}
                            onChange={handleInputChange}
                            required
                        />

                        <label className="company-label" htmlFor="job-type">業種:</label>
                        <div id="job-type-container">
                            {jobTypes.map((jobType, index) => (
                                <div key={index} className="field-group">
                                    <input
                                        type="text"
                                        className="company-input"
                                        value={jobType}
                                        onChange={(e) => handleJobTypeChange(index, e.target.value)}
                                        required
                                    />
                                    {jobTypes.length > 1 && (
                                        <button
                                            type="button"
                                            className="delete-button"
                                            onClick={() => handleRemoveJobType(index)}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="company-button green-button add-button"
                            onClick={handleAddJobType}
                        >
                            ＋
                        </button>

                        <label className="company-label" htmlFor="skills">得意技術:</label>
                        <div id="skills-container">
                            {skills.map((skill, index) => (
                                <div key={index} className="field-group">
                                    <input
                                        type="text"
                                        className="company-input"
                                        value={skill}
                                        onChange={(e) => handleSkillChange(index, e.target.value)}
                                        required
                                    />
                                    {skills.length > 1 && (
                                        <button
                                            type="button"
                                            className="delete-button"
                                            onClick={() => handleRemoveSkill(index)}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="company-button green-button add-button"
                            onClick={handleAddSkill}
                        >
                            ＋
                        </button>
                    </fieldset>
                    
                    <button type="submit" className="company-button submit-button">登録</button>
                </form>
            </div>
        </div>
    );
};

export default Company;
