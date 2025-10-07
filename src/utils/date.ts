/**
 * Format date to dd/mm/yyyy
 * @param date - Date to format
 * @returns Formatted date
 */
export const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
};
//-------------------End-------------------//


/**
 * Format date to mm/yyyy
 * @param date - Date to format
 * @returns Formatted date mm/yyyy
 */
export const formatDateToMMYYYY = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' });
};
//-------------------End-------------------//




