export const validateEmail = (username: string): boolean => {
    // Regular expression to check if the username is in email format
    const emailPattern = /^[\w\.-]+@[\w\.-]+\.\w+$/;
    return emailPattern.test(username);
};
export const validatePassword = (password: string): boolean => {
    // Regular expressions to check if the password meets the criteria
    const lengthCheck = password.length >= 8;
    const charCheck = /[a-zA-Z]/.test(password);
    const numCheck = /\d/.test(password);
    const specialCharCheck = /[!@#$%^&*()-_=+]/.test(password);
    return lengthCheck && charCheck && numCheck && specialCharCheck;
};
export const validateDeviceName = (deviceName: string): boolean => {
    const deviceNamePattern = /^[a-zA-Z0-9]+$/;
    return deviceNamePattern.test(deviceName);
};
export const validateLimit = (min: number, max: number): boolean => {
    return min >= 0 && max >= 0 && min <= max;
};