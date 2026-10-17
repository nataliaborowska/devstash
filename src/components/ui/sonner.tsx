"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      richColors
      position="top-center"
      toastOptions={{ classNames: { toast: "font-sans" } }}
      {...props}
    />
  )
}

export { Toaster }
