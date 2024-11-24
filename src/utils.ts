export const isEmpty = (value?: string) => {
	return !!(!value || (value && !value.trim()))
}

export const displayErrors = (errors: Error[]) => {
	if (!errors.length) return

	const errorString = errors.map((err) => `– ${err.message}`).join('\n')
	throw Error(`\n\n\x1b[31m ❌ You have ${errors.length} errors.\x1b[0m \n\n${errorString}\n`)
}

export const getFromUrl = (url: string, field?: keyof URL) => {
	const urlInstance = new URL(url)
	if (!field) return urlInstance

	return urlInstance[field] as string
}
