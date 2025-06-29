// styles/global.ts
import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#007bff',
  error: '#ff3333',
  background: '#fff',
  button: '#42b1f1',
};

export const globalStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    padding: 5,
    backgroundColor: 'white',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
  },
  button: {
    backgroundColor: colors.button,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});
