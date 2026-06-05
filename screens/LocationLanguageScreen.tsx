import {useEffect} from 'react';
import {View} from 'react-native';

/** Legacy route — merged into ProfileSetup. Redirects immediately. */
const LocationLanguageScreen = ({navigation}: any) => {
  useEffect(() => {
    navigation.replace('ProfileCreation', {step: 2});
  }, [navigation]);
  return <View />;
};

export default LocationLanguageScreen;
