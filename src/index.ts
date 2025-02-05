import crypto from 'node:crypto'

import { displayErrors, emptyStringHash, getDateValues, getFromUrl, log } from './utils'
import { validateArguments } from './validation'

export type HTTPMethod = 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE'

export interface SignatureParameters {
	targetUrl: string
	awsConfig: AwsConfig
	signatureConfig?: SignatureConfig
	method?: Lowercase<HTTPMethod> | HTTPMethod
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

	const httpMethod = params?.method || 'GET'
	const host = getFromUrl(params.targetUrl, 'hostname')
	const canonicalURI = getFromUrl(params.targetUrl, 'pathname')
	const queryStringParams = getFromUrl(params.targetUrl, 'search').split('?')?.at(1)

	const canonicalQuerystring = queryStringParams?.trim() || ''
	const signedHeaders = params?.signatureConfig?.signedHeaders || 'host'
	const canonicalHeaders = params?.signatureConfig?.canonicalHeaders
		? `${params?.signatureConfig?.canonicalHeaders}\n`
		: `host:${host}\n`

	const payloadHash = generatePayloadHash(params.body)
	const canonicalRequest = `${httpMethod}\n${canonicalURI}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`
	const hashCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex')

	const { amzDate, dateStamp } = getDateValues()
	const { region, service, accessKey, secretKey } = params.awsConfig
	const credentialScope = `${dateStamp}/${region}/${service}/${params?.signatureConfig?.credentialScope || 'aws4_request'}`

	const algorithm = params?.signatureConfig?.algorithm || 'AWS4-HMAC-SHA256'
	const signingKey = getSignatureKey(secretKey, dateStamp, region, service)
	const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${hashCanonicalRequest}`
	const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex')

	const authHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
	log.success('Headers signed successfully!')

	return {
		host,
		'X-Amz-Content-Sha256': payloadHash,
		'X-Amz-Date': amzDate,
		Authorization: authHeader,
	}
}

function generatePayloadHash(body?: string) {
	if (!body) return emptyStringHash

	return crypto.createHash('sha256').update(body).digest('hex')
}

function getSignatureKey(awsSecretKey: string, dateStamp: string, regionName: string, serviceName: string) {
	const kDate = crypto.createHmac('sha256', `AWS4${awsSecretKey}`).update(dateStamp).digest()
	const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest()
	const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest()
	const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest()

	return kSigning
}
