import { Switch, Select, SelectItem } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssessmentStore } from '../../../store/assessmentStore';
import SpeechTextarea from '../../../components/common/SpeechTextarea';

export default function StepAIInvolvement() {
  const { draft, updateDraft } = useAssessmentStore();
  const aiDetails = draft.ai_details || {};

  const updateAI = (field: string, value: string | boolean) => {
    updateDraft({ ai_details: { ...aiDetails, [field]: value } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">AI Involvement</h3>
        <p className="text-sm text-gray-500 mt-1">Does this project use artificial intelligence or machine learning?</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">Does this project involve AI or ML?</p>
          <p className="text-xs text-gray-500 mt-1">Including predictive models, automated decision-making, NLP, computer vision, etc.</p>
        </div>
        <Switch
          isSelected={draft.ai_involved || false}
          onValueChange={(val) => updateDraft({ ai_involved: val })}
          color="primary"
          size="lg"
        />
      </div>

      <AnimatePresence>
        {draft.ai_involved && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 overflow-hidden"
          >
            <div className="bg-primary-50/50 rounded-xl p-6 space-y-5 border border-primary-100">
              <p className="text-sm font-medium text-primary-700">AI Details</p>

              <Select
                label="Type of AI / ML Model"
                placeholder="Select model type"
                selectedKeys={aiDetails.model_type ? [aiDetails.model_type] : []}
                onSelectionChange={(keys) => updateAI('model_type', Array.from(keys)[0] as string)}
                variant="bordered"
              >
                <SelectItem key="classification">Classification / Scoring Model</SelectItem>
                <SelectItem key="prediction">Predictive Model</SelectItem>
                <SelectItem key="nlp">Natural Language Processing (NLP)</SelectItem>
                <SelectItem key="computer-vision">Computer Vision</SelectItem>
                <SelectItem key="recommendation">Recommendation System</SelectItem>
                <SelectItem key="generative">Generative AI (LLM, image generation)</SelectItem>
                <SelectItem key="other">Other</SelectItem>
              </Select>

              <SpeechTextarea
                label="Training Data Description"
                placeholder="Describe what data is used to train the model..."
                value={aiDetails.training_data_description || ''}
                onValueChange={(val) => updateAI('training_data_description', val)}
                variant="bordered"
                minRows={2}
              />

              <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Automated Decision-Making?</p>
                  <p className="text-xs text-gray-500 mt-0.5">Does the AI make decisions without human review?</p>
                </div>
                <Switch
                  isSelected={aiDetails.automated_decisions || false}
                  onValueChange={(val) => updateAI('automated_decisions', val)}
                  color="warning"
                  size="sm"
                />
              </div>

              {aiDetails.automated_decisions && (
                <SpeechTextarea
                  label="What decisions are automated?"
                  placeholder="Describe the automated decisions and their impact..."
                  value={aiDetails.decision_description || ''}
                  onValueChange={(val) => updateAI('decision_description', val)}
                  variant="bordered"
                  minRows={2}
                />
              )}

              <Select
                label="Model Transparency"
                placeholder="How transparent is the model?"
                selectedKeys={aiDetails.model_transparency ? [aiDetails.model_transparency] : []}
                onSelectionChange={(keys) => updateAI('model_transparency', Array.from(keys)[0] as string)}
                variant="bordered"
              >
                <SelectItem key="full">Fully Explainable (e.g., decision trees, logistic regression)</SelectItem>
                <SelectItem key="partial">Partially Explainable (e.g., feature importance available)</SelectItem>
                <SelectItem key="black-box">Black Box (e.g., deep learning, complex ensemble)</SelectItem>
                <SelectItem key="unknown">Unknown / Not Assessed</SelectItem>
              </Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
