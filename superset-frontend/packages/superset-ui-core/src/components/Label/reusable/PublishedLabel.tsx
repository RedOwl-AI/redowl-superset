/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Icons } from '@superset-ui/core/components/Icons';
import { t } from '@apache-superset/core/translation';
import { useTheme } from '@apache-superset/core/theme';
import { Label } from '..';

// Define props for the PublishedLabel component
interface PublishedLabelProps {
  isPublished: boolean; // Whether the item is published
  onClick?: () => void; // Optional click handler
}

export const PublishedLabel: React.FC<PublishedLabelProps> = ({
  isPublished,
  onClick,
}) => {
  const theme = useTheme();
  const label = isPublished ? t('Published') : t('Draft');
  const labelType = isPublished ? 'success' : 'primary';

  // Plumage status pills: Draft = primary fill, Published = success fill.
  const color = isPublished
    ? (theme.labelPublishedColor ?? '#ffffff')
    : (theme.labelDraftColor ?? '#ffffff');
  const bg = isPublished
    ? (theme.labelPublishedBg ?? 'var(--success, #0fa05c)')
    : (theme.labelDraftBg ?? 'var(--primary, #182316)');
  const borderColor = isPublished
    ? (theme.labelPublishedBorderColor ?? 'transparent')
    : (theme.labelDraftBorderColor ?? 'transparent');
  const iconColor = isPublished
    ? (theme.labelPublishedIconColor ?? '#ffffff')
    : (theme.labelDraftIconColor ?? '#ffffff');

  const icon = isPublished ? (
    <Icons.CheckCircleOutlined iconSize="s" iconColor={iconColor} />
  ) : (
    <Icons.MinusCircleOutlined iconSize="s" iconColor={iconColor} />
  );

  return (
    <Label
      type={labelType}
      icon={icon}
      onClick={onClick}
      style={{
        color,
        ...(bg && { backgroundColor: bg }),
        ...(borderColor && { borderColor }),
      }}
    >
      {label}
    </Label>
  );
};
