import mongoose from 'mongoose';

export const ALLOWED_CATEGORIES = [
  'studying',
  'training',
  'other',
  'STUDYING',
  'TRAINING',
  'OTHER',
  'RECOVERY',
];

export const ALLOWED_COLORS = [
  'Pink',
  'Blue',
  'Green',
  'Yellow',
  'Lavender',
  'Peach',
  'Mint',
  'Coral',
  'Lilac',
  'Soft Gray',
];

export const ALLOWED_CANVAS_TYPES = ['text', 'number', 'checklist', 'longText'];
export const ALLOWED_LAYOUT_SIZES = ['half-width', 'full-width'];
export const MAX_CANVAS_FIELDS = 30;

export const ALLOWED_FIELD_KEYS = [
  'Subject',
  'Duration (mins)',
  'Exercise',
  'Weight',
  'Sets',
  'Reps',
  'Project',
  'Hardware Used',
  'Tech Stack',
  'Committee',
  'Deck/Resource',
  'Intensity (1-10)',
  'Deadline',
  'Notes',
];

const dynamicFieldSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false, strict: true }
);

const fixedDataSchema = new mongoose.Schema(
  {
    taskName: { type: String, required: true, trim: true, maxlength: 200 },
    day: { type: String, required: true, trim: true, maxlength: 32 },
    startingTime: { type: String, required: true, trim: true, maxlength: 16 },
    durationMinutes: { type: Number, required: true, min: 1, max: 1440 },
    color: { type: String, enum: ALLOWED_COLORS, default: 'Mint' },
  },
  { _id: false, strict: true }
);

const canvasFieldSchema = new mongoose.Schema(
  {
    id: { type: String, maxlength: 100 },
    label: { type: String, required: true, trim: true, maxlength: 120 },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    type: { type: String, enum: ALLOWED_CANVAS_TYPES, default: 'text' },
    layoutSize: { type: String, enum: ALLOWED_LAYOUT_SIZES, default: 'half-width' },
    unit: { type: String, maxlength: 32 },
    subtitle: { type: String, maxlength: 160 },
  },
  { _id: false, strict: true }
);

/**
 * Task Schema: Strictly validates task documents and discards unregistered properties
 * to prevent Mass Assignment and NoSQL payload injection.
 */
const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    taskName: { type: String, trim: true, maxlength: 200 },
    category: { type: String, required: true, enum: ALLOWED_CATEGORIES },
    color: { type: String, enum: ALLOWED_COLORS },
    date: { type: String, maxlength: 64 },
    fields: {
      type: [dynamicFieldSchema],
      default: undefined,
      validate: [(arr: unknown[]) => !arr || arr.length <= MAX_CANVAS_FIELDS, 'Too many fields'],
    },
    fixedData: { type: fixedDataSchema, default: undefined },
    canvasFields: {
      type: [canvasFieldSchema],
      default: undefined,
      validate: [
        (arr: unknown[]) => !arr || arr.length <= MAX_CANVAS_FIELDS,
        'Exceeded maximum allowed canvas fields',
      ],
    },
    day: { type: String, required: true, maxlength: 32 },
    time: { type: String, maxlength: 32 },
    duration: { type: String, maxlength: 32 },
    colorTint: { type: String, maxlength: 64 },
    subtitle: { type: String, maxlength: 240 },
    completed: { type: Boolean, default: false },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
    strict: true,
  }
);

export const Task = mongoose.model('Task', taskSchema);
