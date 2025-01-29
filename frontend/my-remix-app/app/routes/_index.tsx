import React, { useEffect } from 'react';
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "CompSnyc" },
    { name: "description", content: "Welcome to CompSync" },
  ];
};

export default function Index() {
  return (
    <main style={{ height: '100vh', margin: 0, overflow: 'hidden' }}>
      <iframe
        src="http://10.77.113.59:5500/frontend/_cesium"
        style={{ width: '100%', height: '100%', border: 'none' }}
      >
      </iframe>
    </main>
  );
}
