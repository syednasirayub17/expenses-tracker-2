import mongoose from 'mongoose';

export interface ISystemSettings extends mongoose.Document {
  signupEnabled: boolean;
  maintenanceMode: boolean;
  maxUsersAllowed: number;
  allowedDomains: string[];
  createdAt: Date;
  updatedAt: Date;
}

const systemSettingsSchema = new mongoose.Schema(
  {
    signupEnabled: {
      type: Boolean,
      default: true,
      required: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maxUsersAllowed: {
      type: Number,
      default: 1000,
    },
    allowedDomains: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Singleton pattern - only one settings document
systemSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      signupEnabled: true,
      maintenanceMode: false,
      maxUsersAllowed: 1000,
      allowedDomains: [],
    });
  }
  return settings;
};

systemSettingsSchema.statics.updateSettings = async function (updates: Partial<ISystemSettings>) {
  let settings = await this.getSettings();
  Object.assign(settings, updates);
  await settings.save();
  return settings;
};

export default mongoose.model<ISystemSettings>('SystemSettings', systemSettingsSchema);
