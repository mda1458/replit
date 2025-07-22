// Force deployment script to ensure v3 deploys
console.log('FORCE DEPLOY v2025.01.19.v3 - Privacy Policy & AI Consent Features');
console.log('Deploy Timestamp:', new Date().toISOString());
console.log('Deploy ID: 1752938761');

// This file ensures the deployment recognizes changes
module.exports = {
  version: 'v2025.01.19.v3',
  deployId: '1752938761',
  features: [
    'Enhanced Hero Section',
    'Privacy Policy Integration', 
    'AI Consent Modal',
    'Click Here Journey Buttons',
    'Mobile Responsive Design'
  ]
};