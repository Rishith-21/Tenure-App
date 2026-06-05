import {useEffect} from 'react';
import {View} from 'react-native';

/** Legacy route — step 3 lives on ProfileSetupScreen. */
const CategoryPreferenceScreen = ({navigation}: any) => {
  useEffect(() => {
    navigation.replace('ProfileCreation', {step: 3});
  }, [navigation]);
  return <View />;
};

export default CategoryPreferenceScreen;
