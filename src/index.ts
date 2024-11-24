import crypto from 'node:crypto'
import { displayErrors, getFromUrl } from './utils'
import { validateArguments } from './validation'

export type HTTPMethod = 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE'

export interface SignatureParameters {
	/** Specify the endpoint URL for the request to be hit
	 * @example "https://jsonplaceholder.com/todos"
	 */
	targetUrl: string
	awsConfig: AwsConfig
	signatureConfig?: SignatureConfig
	/** Any of the HTTP methods */
	method?: Lowercase<HTTPMethod> | HTTPMethod
	/** Add request body as a string */
	body?: string
}

export interface AwsConfig {
	/** Specify the AWS Region – @example "eu-east-2" */
	region: string
	/** Specify the AWS Service – @example "service-name" */
	service: string
	/** Specify the AWS Key – @example "AABB-CCDD..." */
	accessKey: string
	/** Specify the AWS Key – @example "b9s8d3hhey..." */
	secretKey: string
}

interface SignatureConfig {
	/** Optional – Add any additional signed headers @default "host" */
	signedHeaders?: string
	/** Optional – Add any additional canonical headers @default "host:${host}" */
	canonicalHeaders?: string
	/** Optional – Configure different algorithm to hash the headers @default "AWS4-HMAC-SHA256" */
	algorithm?: string
	/** Optional – Specify different credential scope @default "aws4_request" */
	credentialScope?: string
}

export const signHeaders = (params: SignatureParameters) => {
	const { isInvalid, errors } = validateArguments(params)
	if (isInvalid) return displayErrors(errors)

	const region = params.awsConfig.region
	const service = params.awsConfig.service
	const accessKey = params.awsConfig.accessKey
	const secretKey = params.awsConfig.secretKey

	const httpMethod = params.method || 'GET'
	const host = getFromUrl(params.targetUrl, 'hostname')
	const canonicalURI = getFromUrl(params.targetUrl, 'pathname')

	const canonicalQuerystring = ''
	const signedHeaders = params?.signatureConfig?.signedHeaders || 'host'
	const emptyStringHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
	const payloadHash = params.body ? crypto.createHash('sha256').update(params.body).digest('hex') : emptyStringHash
	const canonicalHeaders = params?.signatureConfig?.canonicalHeaders
		? `${params?.signatureConfig?.canonicalHeaders}\n`
		: `host:${host}\n`

	const canonicalRequest = `${httpMethod}\n${canonicalURI}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`
	const hashCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex')

	const { amzDate, dateStamp } = getDateValues()
	const credentialScope = `${dateStamp}/${region}/${service}/${params?.signatureConfig?.credentialScope || 'aws4_request'}`

	const algorithm = params?.signatureConfig?.algorithm || 'AWS4-HMAC-SHA256'
	const signingKey = getSignatureKey(secretKey, dateStamp, region, service)
	const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${hashCanonicalRequest}`
	const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex')

	const authHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
	console.log('%c \n✅ Headers signed successfully! \n', 'background: darkgreen; color: white')

	return {
		host,
		'X-Amz-Content-Sha256': payloadHash,
		'X-Amz-Date': amzDate,
		Authorization: authHeader,
		'Content-Type': 'application/json',
	}
}

function getSignatureKey(awsSecretKey: string, dateStamp: string, regionName: string, serviceName: string) {
	const kDate = crypto.createHmac('sha256', `AWS4${awsSecretKey}`).update(dateStamp).digest()
	const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest()
	const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest()
	const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest()

	return kSigning
}

function getDateValues() {
	const now = new Date()
	const year = now.getUTCFullYear()
	const month = String(now.getUTCMonth() + 1).padStart(2, '0')
	const day = String(now.getUTCDate()).padStart(2, '0')
	const hours = String(now.getUTCHours()).padStart(2, '0')
	const minutes = String(now.getUTCMinutes()).padStart(2, '0')
	const seconds = String(now.getUTCSeconds()).padStart(2, '0')
	const amzDate = `${year}${month}${day}T${hours}${minutes}${seconds}Z`
	const dateStamp = amzDate.slice(0, 8)

	return { amzDate, dateStamp }
}
