import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISyncMeta extends Document {
  key: string; // e.g., "tech-stack-sync"
  last_sync_commit_id: string;
  last_sync_timestamp: Date;
  updatedAt: Date;
}

export const SyncMetaSchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    last_sync_commit_id: {
      type: String,
      required: true,
    },
    last_sync_timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const SyncMeta: Model<ISyncMeta> =
  mongoose.models.SyncMeta || mongoose.model<ISyncMeta>('SyncMeta', SyncMetaSchema, 'meta_data');

export default SyncMeta;
