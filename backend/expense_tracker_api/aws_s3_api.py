import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
import io
import os
import traceback

class AWS_S3_API:
    def __init__(self, AWS_ACCESS_KEY_ID:str, AWS_SECRET_ACCESS_KEY:str, AWS_STORAGE_BUCKET_NAME:str, AWS_S3_REGION_NAME:str) -> None:
        """
        Initialize the S3 client and set the bucket name.

        AWS_ACCESS_KEY_ID: AWS access key ID
        AWS_SECRET_ACCESS_KEY: AWS secret access key
        AWS_STORAGE_BUCKET_NAME: Name of the S3 bucket
        AWS_S3_REGION_NAME: Region name
        """

        self.__client = boto3.client(
            's3',
            aws_access_key_id = AWS_ACCESS_KEY_ID,
            aws_secret_access_key = AWS_SECRET_ACCESS_KEY,
        )
        self.__BUCKET_NAME = AWS_STORAGE_BUCKET_NAME
        self.__REGION_NAME = AWS_S3_REGION_NAME
    
    def list_all_buckets(self):
        """List all buckets in your account"""
        try:
            response = self.__client.list_buckets()
            for bucket in response['Buckets']:
                print(f'Bucket Name: {bucket["Name"]}')
        except (NoCredentialsError, PartialCredentialsError) as e:
            print(traceback.format_exc())
            return f"Error: {str(e)}"
        except Exception as e:
            print(traceback.format_exc())
            return f"An error occurred: {str(e)}"

    def upload_image_to_s3(self, file, object_path:str, object_name:str, file_type=None, bucket_name=None, region_name=None):
        """
        Upload an image file to Amazon S3. The file can be an in-memory file object or filepath.

        file: File object (not just the file path)
        object_path: Folder path in the S3 bucket where the file will be stored
        object_name: Name of the file (without extension)
        file_type: The type of the file (e.g., 'png', 'jpeg', 'gif', 'webp')
        bucket_name: The name of the S3 bucket - optional (defaults to the initialized bucket name)

        return: URL of the uploaded file or error message
        """
        try:
            # Use the provided bucket name or default to the initialized bucket name
            bucket_name = bucket_name or self.__BUCKET_NAME
            region_name = region_name or self.__REGION_NAME

            # Check if file is a file path or an in-memory file object
            if isinstance(file, str):
                # File is a file path
                file_path = file
                file_name = os.path.basename(file_path)
                file_type = file_type or self.get_file_type(file_name)
                
                if file_type is None:
                    return {"success": False, "msg": "Unsupported file type"}
                
                # Read file content
                with open(file_path, 'rb') as f:
                    file_content = f.read()
                    file_obj = io.BytesIO(file_content)
            
            elif hasattr(file, 'name'):
                # File is an in-memory file object
                file_obj = file
                file_name = getattr(file, 'name', 'unknown')
                file_type = file_type or self.get_file_type(file_name)
                
                if file_type is None:
                    return {"success": False, "msg": "Unsupported file type"}
                
            else:
                return {"success": False, "msg": "Invalid file input"}

            # Determine the content type if not provided
            if file_type is None:
                file_type = self.get_file_type(file)

            if file_type is None:
                return {"success": False, "msg": "Unsupported file type"}

            # Construct the S3 object key
            object_key = f"{object_path}/{object_name}.{file_type}".replace('//', '/')
            # object_key = os.path.join(object_path, f"{object_name}.{file_type}")

            # Upload the file to S3
            self.__client.upload_fileobj(
                file_obj,
                bucket_name,
                object_key,
                ExtraArgs={'ContentType': f'image/{file_type}'}
            )

            # Construct the file URL
            file_url = f"https://{bucket_name}.s3.{region_name}.amazonaws.com/{object_key}"
            return {"success": True, "file_url": file_url}

        except (NoCredentialsError, PartialCredentialsError) as e:
            print(traceback.format_exc())
            return {"success": False, "msg": f"Error: {str(e)}"}
        except Exception as e:
            print(traceback.format_exc())
            return {"success": False, "msg": f"An error occurred: {str(e)}"}
        
    def delete_file_from_s3(self, object_key, bucket_name=None):
        """
        Delete a file from Amazon S3.

        object_key: The key (path) of the file in the S3 bucket, including the folder and filename.
        bucket_name: The name of the S3 bucket - optional (defaults to the initialized bucket name)

        return: Status and Success or Error message
        """
        try:
            bucket_name = bucket_name or self.__BUCKET_NAME
            # Attempt to delete the object from the S3 bucket
            self.__client.delete_object(Bucket=bucket_name, Key=object_key)
            # Return a success message if the deletion is successful
            return {'status': True, 'msg': f"File '{object_key}' deleted successfully from '{bucket_name}'"}

        except (NoCredentialsError, PartialCredentialsError) as e:
            return {'status': False, 'msg': f"Credentials error: {str(e)}"}
        except Exception as e:
            return {'status': False, 'msg': f"An unexpected error occurred: {str(e)}"}

    def get_file_type(self, file_name):
        """
        Get the file type based on the file extension.

        file_name: Name of the file

        Return: File type as a string or None if the type is not recognized
        """
        # Get the file extension
        _, ext = os.path.splitext(file_name)
        ext = ext.lower()  # Ensure the extension is in lowercase

        # Define a mapping of extensions to image types
        extension_to_type = {
            '.jpeg': 'jpeg',
            '.jpg': 'jpeg',
            '.png': 'png',
            '.gif': 'gif',
            '.webp': 'webp'
        }

        # Return the image type if it matches a known type
        return extension_to_type.get(ext, None)  # Returns None if the extension is not recognized
    
    def get_object_key_from_url(self, url):
        """
        Extracts the object key from an S3 URL.

        Args:
            url (str): The full S3 URL.

        Returns:
            str: The object key (path within the bucket).
        """
        try:
            # Split the URL by 'amazonaws.com/' and take the part after it
            key = url.split('amazonaws.com/', 1)[1]
            return key
        except IndexError:
            return None


# if __name__ == "__main__":
#     from dotenv import load_dotenv
#     from pathlib import Path

#     dotenv_path = Path('../backend/.env')
#     load_dotenv(dotenv_path=dotenv_path)

#     AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
#     AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
#     AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
#     AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME')

#     aws_s3_instance = AWS_S3_API(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_STORAGE_BUCKET_NAME, AWS_S3_REGION_NAME)
#     aws_s3_instance.list_all_buckets()

#     sample_url = 'https://expense-tracker-cdn.s3.ap-south-1.amazonaws.com/profile_pics/66ac9e1a21bab4ba5dc275f6.png'
#     obj_key = aws_s3_instance.get_object_key_from_url('')
#     print(obj_key)
#     status_obj = aws_s3_instance.delete_file_from_s3(obj_key)
#     print(status_obj)