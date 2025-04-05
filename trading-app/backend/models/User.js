const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Create broker schema to store multiple broker credentials
const BrokerSchema = new mongoose.Schema({
  brokerId: { 
    type: String, 
    required: true 
  },
  clientId: { 
    type: String, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  }
});

// Create user schema
const UserSchema = new mongoose.Schema({
  userId: {
    type: String, 
    lowercase: true, 
    unique: true, 
    required: [true, "User ID is required"], 
    match: [/^[a-zA-Z0-9]+$/, 'is invalid'], 
    index: true
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  brokers: [BrokerSchema]
}, {timestamps: true});

// Apply the uniqueValidator plugin to UserSchema
UserSchema.plugin(uniqueValidator);

// Register the model
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');
