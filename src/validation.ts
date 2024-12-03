import type { HTTPMethod, SignatureParameters } from '.'
import { isEmpty } from './utils'

type UpdateMethodsType = Extract<HTTPMethod, 'POST' | 'PATCH' | 'PUT'>

const updateMethods: UpdateMethodsType[] = ['POST', 'PATCH', 'PUT']

export const validateArguments = (params: SignatureParameters) => {
	const result = { isInvalid: false, errors: [] as Error[] }
	if (isEmpty(params.targetUrl)) {
		result.isInvalid = true
		result.errors.push(Error('Missing "target" field in the request parameter'))
	}

	if (isEmpty(params.awsConfig.region)) {
		result.isInvalid = true
		result.errors.push(Error('"region" field is empty or null in the "awsConfig.region" object'))
	}

	if (isEmpty(params.awsConfig.accessKey)) {
		result.isInvalid = true
		result.errors.push(Error('"accessKey" field is empty or null in the "awsConfig.accessKey" object'))
	}

	if (isEmpty(params.awsConfig.secretKey)) {
		result.isInvalid = true
		result.errors.push(Error('"secretKey" field is empty or null in the "awsConfig.secretKey" object'))
	}

	if (isEmpty(params.awsConfig.service)) {
		result.isInvalid = true
		result.errors.push(Error('"service" field is empty or null in the "awsConfig.service" object'))
	}

	if (
		updateMethods.includes(params.method as UpdateMethodsType) &&
		params?.body &&
		typeof params?.body !== 'string'
	) {
		result.isInvalid = true
		result.errors.push(Error(`"body" field should be of type string. "${typeof params?.body}" given.`))
	}

	return result
}
