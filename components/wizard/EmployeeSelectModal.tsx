'use client'

import Link from 'next/link'
import type { Employee } from '@/types/database'

interface EmployeeSelectModalProps {
  employees: Employee[]
  onSelect: (employee: Employee) => void
  onSkip: () => void
  isOpen: boolean
}

export function EmployeeSelectModal({ employees, onSelect, onSkip, isOpen }: EmployeeSelectModalProps) {
  if (!isOpen || employees.length === 0) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onSkip}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Koji zaposleni?
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Izaberite sačuvanog zaposlenog ili popunite ručno
        </p>

        <div className="space-y-2 mb-5">
          {employees.map(employee => (
            <button
              key={employee.id}
              type="button"
              onClick={() => onSelect(employee)}
              className="w-full text-left border border-gray-200 rounded-xl p-4 transition-all hover:border-[#1B6B4A] hover:bg-green-50 focus:outline-none focus:border-[#1B6B4A]"
            >
              <span className="font-semibold text-gray-900 text-sm">{employee.ime}</span>
              {employee.pozicija && (
                <div className="mt-0.5 text-xs text-gray-500">{employee.pozicija}</div>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">ili</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={onSkip}
          className="w-full py-2.5 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Popuni ručno
        </button>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Zaposlene možete dodati u{' '}
          <Link href="/profil" className="underline hover:text-gray-600">
            Profil → Sačuvani zaposleni
          </Link>
        </p>
      </div>
    </div>
  )
}
