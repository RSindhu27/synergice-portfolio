let _authenticated = false;

export const getIsAuthenticated = () => _authenticated;
export const setAuthenticated = (v: boolean) => { _authenticated = v; };
