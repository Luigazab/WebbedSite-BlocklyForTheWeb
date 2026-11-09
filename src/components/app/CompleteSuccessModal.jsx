import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Award, ArrowRight } from "lucide-react";
import RewardAnimation from "./RewardAnimation";

export default function CompleteSuccessModal({
  isOpen,
  onExit,
  onContinue,
  earnedXp = 0,
  title = "Lesson completed!",
  message = "Congratulations! Your hard work is paying off.",
  badge = null,
  lastLesson = false,
}) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog onClose={onExit} className="relative z-[100]">
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-[250ms] motion-reduce:duration-0"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-[250ms] motion-reduce:duration-0"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 overflow-y-auto bg-gradient-to-b from-violet-50 via-white to-amber-50">
            <Dialog.Panel className="flex min-h-dvh w-full flex-col items-center justify-center px-6 py-10 text-center">
              <div className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
                <RewardAnimation
                  src={
                    badge ? "/Reward%20light%20effect.lottie" : "/Trophy.lottie"
                  }
                  light={Boolean(badge)}
                />
                {badge && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {badge.image_url && !imageFailed ? (
                      <img
                        src={badge.image_url}
                        alt={badge.name}
                        onError={() => setImageFailed(true)}
                        className="h-36 w-36 object-contain drop-shadow-xl sm:h-44 sm:w-44"
                      />
                    ) : (
                      <Award className="h-36 w-36 text-amber-500" />
                    )}
                  </div>
                )}
              </div>
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
                {badge ? "Topic badge earned" : "You did it!"}
              </p>
              <Dialog.Title className="max-w-xl text-3xl font-extrabold text-foreground sm:text-5xl">
                {badge?.name || title}
              </Dialog.Title>
              <Dialog.Description className="mt-5 max-w-lg text-lg text-foreground">
                {badge ? badge.description || badge.requirement : message}
              </Dialog.Description>
              {!badge && (
                <p className="mt-6 rounded-full bg-amber-100 dark:bg-amber-950/50 px-6 py-3 text-xl font-bold text-amber-800 dark:text-amber-300">
                  +{earnedXp} XP earned
                </p>
              )}
              <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row">
                {badge ? (
                  <button
                    autoFocus
                    onClick={onExit}
                    className="w-full rounded-xl bg-violet-600 px-6 py-4 font-bold text-white hover:bg-violet-700"
                  >
                    Awesome!
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onExit}
                      className="flex-1 rounded-xl border border-border bg-card px-5 py-4 font-semibold text-foreground hover:bg-muted"
                    >
                      Exit to classroom
                    </button>
                    <button
                      autoFocus
                      onClick={onContinue}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-4 font-bold text-white hover:bg-violet-700"
                    >
                      {lastLesson ? "Back to classroom" : "Continue"}
                      <ArrowRight size={18} />
                    </button>
                  </>
                )}
              </div>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
