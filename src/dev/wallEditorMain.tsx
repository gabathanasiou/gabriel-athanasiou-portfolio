import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/animations.css';
import { BrandWallEditor } from './BrandWallEditor';

const root = document.getElementById('wall-editor-root');
if (!root) throw new Error('Missing #wall-editor-root');

createRoot(root).render(<BrandWallEditor />);
