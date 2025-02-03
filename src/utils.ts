export const isEmpty = (value?: string) => {
	return !!(!value || (value && !value.trim()))
}

export const displayErrors = (errors: Error[]) => {
	if (!errors.length) return

	const errorString = errors.map((err) => `– ${err.message}`).join('\n')
	throw Error(`\n\n\x1b[31m ❌ You have ${errors.length} errors.\x1b[0m \n\n${errorString}\n`)
}

export const getFromUrl = <K extends keyof URL>(url: string, field: K) => {
	const urlInstance = new URL(url)
	if (field) return urlInstance[field] || ''

	log.error('No field provided to get from URL')
	return '' as string
}

export const log = {
	success: (text: string) => console.log(`%c \n✅ ${text}\n`, 'background: darkgreen; color: white'),
	error: (text: string) => console.log(`%c \n❌ ${text}\n`, 'background: darkred; color: white'),
}
