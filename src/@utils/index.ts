export interface successResponse {
  success: true;
  data: any;
  message: string;
  status: number;
  source: string | string[];
}

export interface errorResponse {
  success: false;
  message: string;
  status: number;
  source?: string | string[];
  description?: any;
}

export enum SuccessMessage {
  CREATE = '%s created successfully.',
  FETCH = '%s fetched successfully',
  UPDATE = '%s updated successfully',
  DELETE = '%s deleted successfully',
  REMOVE = '%s removed successfully',
  REGISTER = '%s registered successfully',
  LOGGED_IN = '%s logged in successfully',
  STORED = '%s stored successfully',
  PUBLISH = '%s published successfully',
  VERIFY = '%s verified successfully',
  REFRESH = '%s refreshed successfully',
  DEACTIVATE = '%s deactivated',
  ACTIVATE = '%s activated',
  SENT = '%s  sent',
}
