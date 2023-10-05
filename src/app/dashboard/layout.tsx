import Image from 'next/image'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}
) {
  return (
    <section>
        <nav></nav>
        {children}
    </section>
  )
}
