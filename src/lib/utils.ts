import {type ClassValue, clsx} from 'clsx'
import {twMerge} from 'tailwind-merge'
import {PostgrestError} from "@supabase/supabase-js";
import {toast} from "vue-sonner";
import ErrorIcon from "@/components/icons/ErrorIcon.vue";
import SuccessIcon from "@/components/icons/SuccessIcon.vue";
import {markRaw} from "vue";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export async function sleep(duration = 500): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, duration)
    })
}

export function onInteractOutsideDialog(event: Event, loading?: boolean) {
    const target = event.target as HTMLElement;

    if (target?.closest('[data-sonner-toaster]') || loading) {
        return event.preventDefault()
    }
}

export function capitalise(str: string, all: boolean = false) {
    if (!all) {
        return `${str.substring(0, 1).toUpperCase()}${str.substring(1)}`
    }

    return str.split(" ").map(el => `${el.substring(0, 1).toUpperCase()}${el.substring(1)}`).join(" ")
}

export function raiseErrorToast(error: PostgrestError, title: string = "An error occurred") {
    toast(title, {
        description: error.details,
        dismissible: true,
        duration: 3000,
        class: "!bg-red-950 !border-red-800/50 !gap-3",
        icon: markRaw(ErrorIcon),
    })
}

export function raiseSuccessToast(description: string = "Action was successful", title: string = "Success") {
    toast(title, {
        description,
        dismissible: true,
        duration: 1000,
        class: "!bg-emerald-950 !border-emerald-800/50 !gap-3",
        icon: markRaw(SuccessIcon),
    })
}