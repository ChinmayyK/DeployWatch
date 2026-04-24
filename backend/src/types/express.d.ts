declare namespace Express {
  interface Request {
    requestId: string;
    auth?: {
      userId: string;
      email: string;
      role: string;
    };
  }
}
