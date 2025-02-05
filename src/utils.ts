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

export const getDateValues = () => {
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

export const log = {
	success: (text: string) => console.log(`%c \n✅ ${text}\n`, 'background: darkgreen; color: white'),
	error: (text: string) => console.log(`%c \n❌ ${text}\n`, 'background: darkred; color: white'),
}

export const emptyStringHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
