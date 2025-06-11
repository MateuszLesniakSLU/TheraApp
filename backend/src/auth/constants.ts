export const jwtConstants = {
    secret: process.env.JWT_SECRET || 'verySecretKey',
    expiresIn: '1h',
};
