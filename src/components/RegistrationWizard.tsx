import React from 'react';
import { SinglePageApplicationForm } from './SinglePageApplicationForm';

interface RegistrationWizardProps {
  onCancel: () => void;
  onViewStatus: (appId: string) => void;
  onContactSupport: () => void;
  initialBusinessTypeId?: string;
}

export const RegistrationWizard: React.FC<RegistrationWizardProps> = (props) => {
  return <SinglePageApplicationForm {...props} />;
};
