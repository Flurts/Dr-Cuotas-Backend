// awsConfig.ts

import AWS from "aws-sdk";
import config from ".";

// Configurar las credenciales de AWS
AWS.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region // por ejemplo, 'us-west-2'
});

export default AWS;
