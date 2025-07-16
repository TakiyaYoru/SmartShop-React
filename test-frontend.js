// Test script for frontend build
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧪 Testing Frontend Build...\n');

try {
  // Check if node_modules exists
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Check if package.json exists
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found');
  }

  // Check if ChatWidget component exists
  const chatWidgetPath = path.join(process.cwd(), 'src/components/chat/ChatWidget.jsx');
  if (!fs.existsSync(chatWidgetPath)) {
    throw new Error('ChatWidget.jsx not found');
  }

  // Check if chat GraphQL queries exist
  const chatGraphqlPath = path.join(process.cwd(), 'src/graphql/chat.js');
  if (!fs.existsSync(chatGraphqlPath)) {
    throw new Error('chat.js GraphQL queries not found');
  }

  // Check if Layout component exists
  const layoutPath = path.join(process.cwd(), 'src/components/common/Layout.jsx');
  if (!fs.existsSync(layoutPath)) {
    throw new Error('Layout.jsx not found');
  }

  console.log('✅ All required files exist');
  console.log('✅ Dependencies installed');
  console.log('✅ Ready to start development server');
  
  console.log('\n🚀 To start frontend:');
  console.log('   npm run dev');
  
  console.log('\n🌐 Test URLs:');
  console.log('   - Main app: http://localhost:5173');
  console.log('   - Chat test: http://localhost:5173/chat-test');
  
  console.log('\n📋 Test Steps:');
  console.log('   1. Start backend: cd ../server && npm run dev');
  console.log('   2. Start frontend: npm run dev');
  console.log('   3. Open browser and go to chat test page');
  console.log('   4. Click chat button and test messages');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
} 