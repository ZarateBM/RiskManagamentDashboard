
import Link from 'next/link'

export const Nav = () => {
  return (
    <div className="flex flex-row justify-between h-16 items-center px-4 bg-primary-blue">
      <Link href="/dashboard">
        <img src="firma-tipografica-ucr.svg" alt="Logo UCR" />
      </Link>
    </div>
  )
}