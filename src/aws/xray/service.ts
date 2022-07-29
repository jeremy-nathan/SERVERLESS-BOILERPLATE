import AWSXRay from 'aws-xray-sdk';

import { isXRayEnabled, XRayLogger } from '../../utils/logger';

if (isXRayEnabled) {
	AWSXRay.setLogger(XRayLogger);
}

export default AWSXRay;
