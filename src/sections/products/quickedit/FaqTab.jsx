import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import SectionLabel from './SectionLabel';

export default function FaqTab({
    formData,
    addFaq,
    removeFaq,
    updateFaq,
    canEditDescription,
}) {
    return (
        <Stack spacing={3}>

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <SectionLabel>
                    Product FAQs
                </SectionLabel>

                <Button
                    variant="contained"
                    disabled={!canEditDescription()}
                    onClick={addFaq}
                >
                    Add FAQ
                </Button>
            </Stack>

            {!formData.faqs?.length && (
                <Alert severity="info">
                    No FAQs added yet.
                </Alert>
            )}

            {formData.faqs?.map((faq, index) => (

                <Box
                    key={index}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 2,
                    }}
                >

                    <Stack spacing={2}>

                        <TextField
                            fullWidth
                            label={`Question ${index + 1}`}
                            disabled={!canEditDescription()}
                            value={faq.question || ''}
                            onChange={(e) =>
                                updateFaq(
                                    index,
                                    'question',
                                    e.target.value
                                )
                            }
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Answer"
                            disabled={!canEditDescription()}
                            value={faq.answer || ''}
                            onChange={(e) =>
                                updateFaq(
                                    index,
                                    'answer',
                                    e.target.value
                                )
                            }
                        />

                        <Stack
                            direction="row"
                            justifyContent="flex-end"
                        >
                            <Button
                                color="error"
                                disabled={!canEditDescription()}
                                onClick={() =>
                                    removeFaq(index)
                                }
                            >
                                Remove
                            </Button>
                        </Stack>

                    </Stack>

                </Box>

            ))}

        </Stack>
    );
}

FaqTab.propTypes = {
    formData: PropTypes.object.isRequired,
    addFaq: PropTypes.func.isRequired,
    removeFaq: PropTypes.func.isRequired,
    updateFaq: PropTypes.func.isRequired,
    canEditDescription: PropTypes.func.isRequired,
};