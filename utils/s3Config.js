const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const uploadToS3 = async (file, folder = 'profiles') => {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read',
      CacheControl: 'max-age=31536000'
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log('✅ File uploaded to S3:', fileUrl);
    return fileUrl;
  } catch (error) {
    console.error('❌ S3 upload failed:', error);
    throw new Error('File upload failed: ' + error.message);
  }
};

const deleteFromS3 = async (fileUrl) => {
  if (!fileUrl || !fileUrl.includes(process.env.S3_BUCKET_NAME)) {
    return;
  }
  
  try {
    const key = fileUrl.split('/').slice(3).join('/'); // Extract key from URL
    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    console.log('✅ File deleted from S3:', key);
  } catch (error) {
    console.error('❌ S3 delete failed:', error);
  }
};

const getS3FileKey = (fileUrl) => {
  if (!fileUrl) return null;
  return fileUrl.split('/').slice(3).join('/');
};

module.exports = {
  s3Client,
  uploadToS3,
  deleteFromS3,
  getS3FileKey
};