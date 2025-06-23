// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'

import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {

    const [isLoading, setIsLoading] = React.useState(true);
    const [userToken, setUserToken] = React.useState(null);

    React.useEffect(() => {
        const checkToken = async () => {
            const token = await SecureStore.getItemAsync('access_token');
            setUserToken(token);
            setIsLoading(false);
        };
        checkToken();
    }, []);

    if (isLoading) {
        return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
        </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={userToken ? 'Home' : 'Login'}>
                {userToken ? (
                <Stack.Screen name="Home" component={HomeScreen} />
                ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );

}
