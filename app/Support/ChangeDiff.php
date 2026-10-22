<?php

namespace App\Support;

class ChangeDiff
{
    public const LABELS = [
        'name' => 'Name',
        'firstName' => 'First Name',
        'middleName' => 'Middle Name',
        'surname' => 'Surname',
        'ext' => 'Ext.',
        'sex' => 'Sex',
        'bloodType' => 'Blood Type',
        'brgy' => 'Barangay',
        'location' => 'Location',
        'contact' => 'Contact Number',
        'bday' => 'Birthday',
        'weight' => 'Weight',
        'bp' => 'Blood Pressure',
        'height' => 'Height',
        'hemoglobin' => 'Hemoglobin',
        'eligibilityStatus' => 'Eligibility Status',
        'allergies' => 'Allergies',
        'medicalConditions' => 'Medical Conditions',
        'deferralReason' => 'Deferral Notes',
        'emergencyContactName' => 'Emergency Contact Name',
        'emergencyContactNumber' => 'Emergency Contact Number',
        'venue' => 'Venue',
        'timesDonated' => 'Times Donated',
        'amount' => 'Amount',
        'donationDate' => 'New Donation',
        'lastDonation' => 'Last Donation',
        'priorLastDonation' => 'Last Donation',
        'newDonation' => 'New Donation',
    ];

    private const NAME_PARTS = ['firstName', 'middleName', 'surname', 'ext'];

    public static function between(array $old, array $new, ?array $only = null): array
    {
        $parts = [];
        $keys = $only ?? array_keys(self::LABELS);
        $nameChanged = false;
        if (in_array('name', $keys, true)) {
            $nameChanged = self::norm($old['name'] ?? null) !== self::norm($new['name'] ?? null);
        }

        foreach ($keys as $key) {
            if (!isset(self::LABELS[$key]) || !array_key_exists($key, $new)) {
                continue;
            }
            if ($nameChanged && in_array($key, self::NAME_PARTS, true)) {
                continue;
            }
            $from = self::norm($old[$key] ?? null);
            $to = self::norm($new[$key] ?? null);
            if ($from === $to) {
                continue;
            }
            $parts[] = self::LABELS[$key] . ': ' . $from . ' > ' . $to;
        }

        return $parts;
    }

    public static function format(array $parts): string
    {
        return $parts ? "Updated Information:\nChange: " . implode("\nChange: ", $parts) : '';
    }

    private static function norm($value): string
    {
        if (is_array($value)) {
            $value = implode(', ', $value);
        }
        $value = trim((string) $value);

        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $value, $d)) {
            return $d[2] . '-' . $d[3] . '-' . $d[1];
        }

        if (preg_match('/^1\s*unit(\/bag)?$/i', $value)) {
            return '1 Bag';
        }

        return $value === '' || strtolower($value) === 'n/a' ? 'None' : $value;
    }
}
