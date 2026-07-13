import { Badge } from '../../../shared/components/common/Badge';
import {
  REGISTRATION_STATUS_LABEL,
  REGISTRATION_STATUS_TONE,
  EVENT_STATUS_LABEL,
  EVENT_STATUS_TONE,
} from '../../../shared/utils/constants';

export function StatusBadge({ type = 'registration', status }) {
  if (type === 'event') {
    return <Badge tone={EVENT_STATUS_TONE[status] || 'neutral'}>{EVENT_STATUS_LABEL[status] || status}</Badge>;
  }
  return <Badge tone={REGISTRATION_STATUS_TONE[status] || 'neutral'}>{REGISTRATION_STATUS_LABEL[status] || status}</Badge>;
}
