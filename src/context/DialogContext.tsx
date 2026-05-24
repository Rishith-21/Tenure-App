import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AppDialog, {
  AppDialogButton,
  AppDialogButtonStyle,
} from '../components/ui/AppDialog';
import {setDialogRef} from './dialogRef';

type AlertOptions = {
  title: string;
  message?: string;
  buttonText?: string;
  onClose?: () => void;
};

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

type ChoiceOption = {
  text: string;
  onPress: () => void;
};

type ChoiceOptions = {
  title: string;
  message?: string;
  options: ChoiceOption[];
  cancelText?: string;
};

type DialogContextValue = {
  showAlert: (options: AlertOptions) => void;
  showConfirm: (options: ConfirmOptions) => void;
  showChoice: (options: ChoiceOptions) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

const DialogProvider = ({children}: {children: React.ReactNode}) => {
  const [config, setConfig] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    buttons: AppDialogButton[];
  }>({
    visible: false,
    title: '',
    buttons: [],
  });

  const hide = useCallback(() => {
    setConfig(prev => ({...prev, visible: false}));
  }, []);

  const show = useCallback(
    (title: string, message: string | undefined, buttons: AppDialogButton[]) => {
      setConfig({visible: true, title, message, buttons});
    },
    [],
  );

  const showAlert = useCallback(
    ({title, message, buttonText = 'OK', onClose}: AlertOptions) => {
      show(title, message, [{text: buttonText, onPress: onClose}]);
    },
    [show],
  );

  const showConfirm = useCallback(
    ({
      title,
      message,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      destructive = false,
      onConfirm,
      onCancel,
    }: ConfirmOptions) => {
      const confirmStyle: AppDialogButtonStyle = destructive
        ? 'destructive'
        : 'default';
      show(title, message, [
        {text: cancelText, style: 'cancel', onPress: onCancel},
        {text: confirmText, style: confirmStyle, onPress: onConfirm},
      ]);
    },
    [show],
  );

  const showChoice = useCallback(
    ({title, message, options, cancelText = 'Cancel'}: ChoiceOptions) => {
      show(title, message, [
        ...options.map(opt => ({
          text: opt.text,
          onPress: opt.onPress,
        })),
        {text: cancelText, style: 'cancel' as const},
      ]);
    },
    [show],
  );

  const value = useMemo(
    () => ({showAlert, showConfirm, showChoice}),
    [showAlert, showConfirm, showChoice],
  );

  useEffect(() => {
    setDialogRef(value);
    return () => setDialogRef(null);
  }, [value]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      <AppDialog
        visible={config.visible}
        title={config.title}
        message={config.message}
        buttons={config.buttons}
        onDismiss={hide}
      />
    </DialogContext.Provider>
  );
};

export const useAppDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useAppDialog must be used within DialogProvider');
  }
  return ctx;
};

export default DialogProvider;
