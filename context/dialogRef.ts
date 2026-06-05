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

export type DialogApi = {
  showAlert: (options: AlertOptions) => void;
  showConfirm: (options: ConfirmOptions) => void;
  showChoice: (options: ChoiceOptions) => void;
};

let dialogApi: DialogApi | null = null;

export const setDialogRef = (api: DialogApi | null) => {
  dialogApi = api;
};

export const appDialog = {
  showAlert: (options: AlertOptions) => {
    dialogApi?.showAlert(options);
  },
  showConfirm: (options: ConfirmOptions) => {
    dialogApi?.showConfirm(options);
  },
  showChoice: (options: ChoiceOptions) => {
    dialogApi?.showChoice(options);
  },
};
