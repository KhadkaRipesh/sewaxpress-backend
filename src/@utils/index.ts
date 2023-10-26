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
