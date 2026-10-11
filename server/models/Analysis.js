const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message_content: {
      type: String,
      required: true,
      trim: true,
    },
    risk_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      required: true,
      enum: ['legitimate', 'spam', 'phishing', 'spoofing'],
    },
    red_flags: {
      type: [String],
      default: [],
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.message = ret.message_content;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.message = ret.message_content;
        delete ret.__v;
        return ret;
      },
    },
  }
);

analysisSchema.virtual('message').get(function () {
  return this.message_content;
});

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;
