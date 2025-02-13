const useUsersQuery = async (user: string, password: string): Promise<boolean> => {
    const API_URL = "https://pad-api-lkii.onrender.com";

    try {
        const response = await fetch(`${API_URL}/users/?login=${user}&password=${password}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (data == true) {
            console.log('Login success');
            return true;
        } else {
            console.log('Login failed');
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
};

export default useUsersQuery;