import * as XLSX from 'xlsx';
import { formatDate } from './taCalculator';

/**
 * Exports Journal Data to Excel (.xlsx) mimicking S4 format
 */
export const exportToExcel = (profile, journeys) => {
  if (!profile || journeys.length === 0) return;

  const title = [
    ["WESTERN RAILWAY"],
    ["JOURNAL OF DUTY PERFORMED BY"],
    []
  ];

  const profileInfo = [
    ["Name:", profile.name, "Designation:", profile.designation],
    ["Station:", profile.station, "PF No:", profile.pfNumber],
    ["Basic Pay:", profile.basicPay, "Level:", profile.level],
    []
  ];

  const headers = [
    ["Date", "Train No", "From", "To", "Dep Station", "Dep Time", "Arr Station", "Arr Time", "KM", "TA %", "Amount (Rs)"]
  ];

  const rows = journeys.map(j => [
    formatDate(j.date),
    j.trainNo || "-",
    j.from,
    j.to,
    j.from,
    j.depTime,
    j.to,
    j.arrTime,
    j.km,
    `${j.percentage}%`,
    j.amount.toFixed(2)
  ]);

  const totalAmount = journeys.reduce((sum, j) => sum + j.amount, 0);
  const totalRow = [
    [],
    ["", "", "", "", "", "", "", "", "", "GRAND TOTAL", totalAmount.toFixed(2)]
  ];

  const footer = [
    [],
    ["Signature of Employee", "", "In-Charge Signature", "", "Countersigned"]
  ];

  // Combine all data
  const data = [...title, ...profileInfo, ...headers, ...rows, ...totalRow, ...footer];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const wscols = [
    { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, 
    { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 12 }
  ];
  ws['!cols'] = wscols;

  // Create workbook and append sheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "TA Journal");

  // Save File
  const filename = `TA_Journal_${profile.name.replace(/\s+/g, '_')}_${new Date().getMonth() + 1}.xlsx`;
  XLSX.writeFile(wb, filename);
};
