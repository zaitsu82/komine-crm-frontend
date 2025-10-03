import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | null) {
  if (!date) return ""
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function formatDateWithEra(date: Date | string | null) {
  if (!date) return ""
  
  // 文字列の日付をDateオブジェクトに変換
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // 無効な日付の場合は空文字列を返す
  if (isNaN(dateObj.getTime())) return ""
  
  const year = dateObj.getFullYear()
  const heiseiStart = 1989
  const reiwaStart = 2019
  
  let era = ""
  let eraYear = 0
  
  if (year >= reiwaStart) {
    era = "令和"
    eraYear = year - reiwaStart + 1
  } else if (year >= heiseiStart) {
    era = "平成"
    eraYear = year - heiseiStart + 1
  }
  
  return `${era}${eraYear}年 ${dateObj.getMonth() + 1}月${dateObj.getDate()}日`
}