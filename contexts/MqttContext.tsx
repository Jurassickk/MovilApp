import { createContext } from 'react';
import type { MqttContextType, MqttProviderConditionalProps } from '@/types/mqtt';

const MqttContext = createContext<MqttContextType | undefined>(undefined);
export default MqttContext;