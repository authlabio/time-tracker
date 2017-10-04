const apiBase = 'http://localhost:3000/v1/';

export function getApiUrl(ext) {
	return apiBase + ext;
}