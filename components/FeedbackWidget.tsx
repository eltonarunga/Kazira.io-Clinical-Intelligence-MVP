import React, { useState } from 'react';
import Button from './Button';
import { toast } from 'sonner';

const FeedbackWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Feedback submitted successfully! Thank you.');
      onClose();
    }, 800);
  };

  return (
    <div className="text-ink3">
      <h3 className="text-lg font-bold text-ink mb-2 font-serif">Send Feedback</h3>
      <p className="text-sm mb-4">We'd love to hear your thoughts on Kazira Clinical Intelligence. How can we improve?</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full h-32 p-3 text-sm border border-border2 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none resize-none bg-surface"
          placeholder="Tell us what you think..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          required
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting} disabled={!feedback.trim()}>
            Submit Feedback
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackWidget;
