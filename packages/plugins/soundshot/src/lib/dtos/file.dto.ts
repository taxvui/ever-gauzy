import { FileStorageProviderEnum, UploadedFile } from '@gauzy/contracts';
import { ApiProperty } from '@nestjs/swagger';
import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	Matches,
	MaxLength,
	Min
} from 'class-validator';

export class FileDTO implements UploadedFile {
	@ApiProperty({
		description: 'The field name associated with the file',
		example: 'soundshotFile'
	})
	@IsNotEmpty({ message: 'Field name must not be empty' })
	@IsString({ message: 'Field name must be a string' })
	@MaxLength(255, { message: 'Field name must not exceed 255 characters' })
	fieldname: string;

	@ApiProperty({
		description: 'The file path or identifier of the soundshot',
		example: 'project-demo-2024.webm',
		pattern: '/\\.(webm)$/'
	})
	@IsNotEmpty({ message: 'File key must not be empty' })
	@IsString({ message: 'File key must be a string' })
	@MaxLength(255, { message: 'File key must not exceed 255 characters' })
	@Matches(/\.(webm)$/, {
		message: 'File must be a valid soundshot format webm'
	})
	key: string;

	@ApiProperty({
		description: 'The original file name',
		example: 'project-demo-original.webm'
	})
	@IsNotEmpty({ message: 'Original name must not be empty' })
	@IsString({ message: 'Original name must be a string' })
	@MaxLength(255, { message: 'Original name must not exceed 255 characters' })
	originalname: string;

	@ApiProperty({
		description: 'The size of the file in bytes',
		example: 10485760
	})
	@IsNotEmpty({ message: 'File size must not be empty' })
	@IsNumber({}, { message: 'File size must be a number' })
	@IsPositive({ message: 'File size must be a positive number' })
	@Min(1, { message: 'File size must be at least 1 byte' })
	size: number;

	@ApiProperty({
		description: 'The file encoding (if available)',
		example: '7bit'
	})
	@IsOptional()
	@IsString({ message: 'Encoding must be a string' })
	@MaxLength(50, { message: 'Encoding must not exceed 50 characters' })
	encoding?: string;

	@ApiProperty({
		description: 'The MIME type of the file (if available)',
		example: 'audio/webm'
	})
	@IsOptional()
	@IsString({ message: 'MIME type must be a string' })
	@MaxLength(50, { message: 'MIME type must not exceed 50 characters' })
	@Matches(/\/webm$/, {
		message: 'MIME type must be audio/webm'
	})
	mimetype?: string;

	@ApiProperty({
		description: 'The storage provider used for the file',
		example: FileStorageProviderEnum.LOCAL,
		enum: FileStorageProviderEnum
	})
	@IsOptional()
	@IsEnum(FileStorageProviderEnum, { message: 'Invalid file storage provider' })
	storageProvider?: FileStorageProviderEnum;

	@ApiProperty({
		description: 'The file name',
		example: 'project-demo-2024.webm'
	})
	@IsNotEmpty({ message: 'File name must not be empty' })
	@IsString({ message: 'File name must be a string' })
	@MaxLength(255, { message: 'File name must not exceed 255 characters' })
	filename: string;

	@ApiProperty({
		description: 'The public URL of the file',
		example: 'https://example.com/soundshot-demo-2024.webm'
	})
	@IsNotEmpty({ message: 'File URL must not be empty' })
	@MaxLength(2083, { message: 'File URL must not exceed 2083 characters' }) // 2083 is the maximum URL length in browsers
	url: string;

	@ApiProperty({
		description: 'The full path of the file',
		example: '/uploads/project-demo-2024.webm'
	})
	@IsNotEmpty({ message: 'File path must not be empty' })
	@IsString({ message: 'File path must be a string' })
	@MaxLength(1024, { message: 'File path must not exceed 1024 characters' })
	path: string;
}
