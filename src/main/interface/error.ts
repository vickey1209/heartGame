interface errorObj {
    errorCode: number;
    errorMessage: string;
  }

export interface errorRes {
    success: boolean;
    error: errorObj | null;
  }