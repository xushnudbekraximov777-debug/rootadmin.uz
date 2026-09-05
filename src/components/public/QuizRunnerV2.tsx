import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X, Brain, Trophy, RotateCcw, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Quiz, QuizQuestion, QuizOption } from "../../lib/types";

const HUD_BG = "#050B14";

type QuestionWithOptions = QuizQuestion & { options: QuizOption[] };

export function QuizRunnerV2() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    (async () => {
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!quizData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setQuiz(quizData as Quiz);

      const { data: qRows } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", id)
        .order("position", { ascending: true });

      const qs = (qRows as QuizQuestion[]) ?? [];
      const withOptions: QuestionWithOptions[] = [];

      for (const q of qs) {
        const { data: opts } = await supabase
          .from("quiz_options")
          .select("*")
          .eq("question_id", q.id)
          .order("position", { ascending: true });
        withOptions.push({ ...q, options: (opts as QuizOption[]) ?? [] });
      }

      setQuestions(withOptions);
      setAnswers(new Array(withOptions.length).fill(null));
      setLoading(false);
    })();
  }, [id]);

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = selectedOption;
    setAnswers(newAnswers);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(newAnswers[currentIdx + 1]);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setAnswers(new Array(questions.length).fill(null));
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: HUD_BG }}>
        <div className="font-mono text-accent animate-pulse">Loading quiz...</div>
      </div>
    );
  }

  if (notFound || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: HUD_BG }}>
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-slate-700" />
          <p className="font-mono text-slate-500 mb-4">Quiz not found.</p>
          <Link to="/" className="text-sm text-accent hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const selected = answers[idx];
      const correctOpt = q.options.find((o) => o.is_correct);
      if (selected && correctOpt && selected === correctOpt.id) correctCount++;
    });
    const total = questions.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = percentage >= 70;

    return (
      <div className="min-h-screen relative" style={{ background: HUD_BG }}>
        <div className="h-16" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl px-4 sm:px-6 py-12"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-accent transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>

          {/* Results card */}
          <div
            className="relative rounded-2xl border p-8 mb-8"
            style={{
              borderColor: passed ? "rgba(34 255 136 / 0.3)" : "rgba(239 68 68 / 0.3)",
              background: passed ? "rgba(34 255 136 / 0.04)" : "rgba(239 68 68 / 0.04)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="absolute top-0 left-0 h-10 w-10 border-l border-t rounded-tl-2xl" style={{ borderColor: passed ? "rgba(34 255 136 / 0.4)" : "rgba(239 68 68 / 0.4)" }} />
            <div className="absolute bottom-0 right-0 h-10 w-10 border-r border-b rounded-br-2xl" style={{ borderColor: passed ? "rgba(34 255 136 / 0.4)" : "rgba(239 68 68 / 0.4)" }} />

            <div className="text-center relative">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 mb-4"
                style={{
                  borderColor: passed ? "rgba(34 255 136 / 0.5)" : "rgba(239 68 68 / 0.5)",
                  background: passed ? "rgba(34 255 136 / 0.08)" : "rgba(239 68 68 / 0.08)",
                }}
              >
                <Trophy className={`h-8 w-8 ${passed ? "text-green-400" : "text-red-400"}`} />
              </div>

              <h1 className="text-2xl font-bold text-slate-100 mb-2">
                {passed ? "Mission Accomplished" : "System Report"}
              </h1>
              <p className="font-mono text-sm text-slate-500 mb-6">
                {passed ? "You have demonstrated proficiency." : "Additional training recommended."}
              </p>

              {/* Score display */}
              <div className="inline-flex items-baseline gap-2 mb-6">
                <span className={`text-5xl font-bold ${passed ? "text-green-400" : "text-red-400"}`}>
                  {correctCount}
                </span>
                <span className="text-2xl font-mono text-slate-600">/ {total}</span>
              </div>
              <p className="text-sm text-slate-400 mb-1">Correct Answers</p>
              <p className={`text-lg font-mono ${passed ? "text-green-400" : "text-red-400"}`}>
                {percentage}% Score
              </p>
            </div>
          </div>

          {/* Answer breakdown */}
          <div className="space-y-3 mb-8">
            <h2 className="text-sm font-mono text-slate-500 mb-4">// Answer Breakdown</h2>
            {questions.map((q, idx) => {
              const selected = answers[idx];
              const correctOpt = q.options.find((o) => o.is_correct);
              const isCorrect = selected && correctOpt && selected === correctOpt.id;
              return (
                <div
                  key={q.id}
                  className="rounded-lg border p-4"
                  style={{
                    borderColor: isCorrect ? "rgba(34 255 136 / 0.2)" : "rgba(239 68 68 / 0.2)",
                    background: isCorrect ? "rgba(34 255 136 / 0.03)" : "rgba(239 68 68 / 0.03)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 ${
                        isCorrect ? "bg-green-500/20" : "bg-red-500/20"
                      }`}
                    >
                      {isCorrect ? (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 mb-1">
                        <span className="font-mono text-slate-600">Q{idx + 1}.</span> {q.text}
                      </p>
                      {!isCorrect && (
                        <p className="text-xs text-green-400 font-mono">
                          Correct: {correctOpt?.text ?? "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent hover:bg-accent/20 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-base-600 px-4 py-2 text-sm text-slate-400 hover:text-accent hover:border-accent/30 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz question screen
  const currentQ = questions[currentIdx];
  const totalQ = questions.length;

  if (!currentQ) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: HUD_BG }}>
        <div className="text-center">
          <p className="font-mono text-slate-500 mb-4">This quiz has no questions yet.</p>
          <Link to="/" className="text-sm text-accent hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: HUD_BG }}>
      <div className="h-16" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl px-4 sm:px-6 py-12"
      >
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        {/* Quiz header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="rounded-full border border-accent/30 px-2.5 py-0.5 text-[10px] font-mono text-accent"
              style={{ background: "rgba(var(--accent) / 0.06)" }}
            >
              {quiz.category}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">{quiz.title}</h1>
          {quiz.description && (
            <p className="mt-2 text-sm text-slate-500">{quiz.description}</p>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-600">
              Question {currentIdx + 1} of {totalQ}
            </span>
            <span className="text-xs font-mono text-slate-600">
              {Math.round(((currentIdx) / totalQ) * 100)}% complete
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-base-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: `${(currentIdx / totalQ) * 100}%` }}
              animate={{ width: `${((currentIdx + 1) / totalQ) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="rounded-2xl border border-accent/20 p-6 mb-6"
              style={{ background: "rgba(var(--accent) / 0.03)", backdropFilter: "blur(16px)" }}
            >
              <h2 className="text-lg font-semibold text-slate-100 mb-6">{currentQ.text}</h2>

              {currentQ.image_url && (
                <img
                  src={currentQ.image_url}
                  alt="Question diagram"
                  className="border border-emerald-500/30 rounded-lg max-h-80 object-contain shadow-[0_0_15px_rgba(16,185,129,0.15)] mb-6 mx-auto"
                />
              )}

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, oi) => {
                  const isSelected = selectedOption === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                        isSelected
                          ? "border-accent/50 bg-accent/10"
                          : "border-base-700 bg-base-900/30 hover:border-accent/25 hover:bg-base-800/50"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 font-mono text-xs transition-colors ${
                          isSelected
                            ? "border-accent text-accent bg-accent/10"
                            : "border-base-600 text-slate-500"
                        }`}
                      >
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className={`text-sm ${isSelected ? "text-slate-100" : "text-slate-400"}`}>
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next button */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className={`inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
              selectedOption
                ? "border border-accent/40 bg-accent/15 text-accent hover:bg-accent/25"
                : "border border-base-700 bg-base-800/30 text-slate-600 cursor-not-allowed"
            }`}
          >
            {currentIdx < totalQ - 1 ? "Next" : "Finish"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
