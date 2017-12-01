import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getIEVersion } from './utils/browser-utils';
import baseStyles from './node-renderer-default.scss';
import { isDescendant } from './utils/tree-data-utils';
import {dataConfig as dataConfigDefault} from "./utils/default-handlers"

let styles = baseStyles;
// Add extra classes in browsers that don't support flex
if (getIEVersion < 10) {
  styles = {
    ...baseStyles,
    row: `${styles.row} ${styles.row_NoFlex}`,
    rowContents: `${styles.rowContents} ${styles.rowContents_NoFlex}`,
    rowLabel: `${styles.rowLabel} ${styles.rowLabel_NoFlex}`,
    rowToolbar: `${styles.rowToolbar} ${styles.rowToolbar_NoFlex}`,
  };
}

class NodeRendererDefault extends Component {
  render() {
    const {
      scaffoldBlockPxWidth,
      toggleChildrenVisibility,
      dataConfig,
      connectDragPreview,
      connectDragSource,
      isDragging,
      canDrop,
      canDrag,
      node,
      title,
      subtitle,
      draggedNode,
      path,
      treeIndex,
      isSearchMatch,
      isSearchFocus,
      buttons,
      className,
      style,
      didDrop,
      isOver, // Not needed, but preserved for other renderers
      parentNode, // Needed for dndManager
      ...otherProps
    } = this.props;
    const {get} = dataConfig
    const nodeTitle = title || get(node, 'title');
    const nodeSubtitle = subtitle || get(node, 'subtitle');
    const children = get(node, 'children');
    const expanded = get(node, 'expanded');

    let handle;
    if (canDrag) {
      if (typeof children === 'function' && expanded) {
        // Show a loading symbol on the handle when the children are expanded
        //  and yet still defined by a function (a callback to fetch the children)
        handle = (
          <div className={styles.loadingHandle}>
            <div className={styles.loadingCircle}>
              <div className={styles.loadingCirclePoint} />
              <div className={styles.loadingCirclePoint} />
              <div className={styles.loadingCirclePoint} />
              <div className={styles.loadingCirclePoint} />
              <div className={styles.loadingCirclePoint} />
              <div className={styles.loadingCirclePoint} />
              <div className={styles.loadingCirclePoint} />
              <div className={styles.loadingCirclePoint} />
              <div className={styles.loadingCirclePoint} />
              <div className={styles.loadingCirclePoint} />
              <div className={styles.loadingCirclePoint} />
              <div className={styles.loadingCirclePoint} />
            </div>
          </div>
        );
      } else {
        // Show the handle used to initiate a drag-and-drop
        handle = connectDragSource(<div className={styles.moveHandle} />, {
          dropEffect: 'copy',
        });
      }
    }

    const isDraggedDescendant = draggedNode && isDescendant(draggedNode, node, dataConfig);
    const isLandingPadActive = !didDrop && isDragging;

    return (
      <div style={{ height: '100%' }} {...otherProps}>
        {toggleChildrenVisibility &&
          children &&
          (children.length > 0 || typeof children === 'function') && (
            <div>
              <button
                type="button"
                aria-label={expanded ? 'Collapse' : 'Expand'}
                className={
                  expanded ? styles.collapseButton : styles.expandButton
                }
                style={{ left: -0.5 * scaffoldBlockPxWidth }}
                onClick={() =>
                  toggleChildrenVisibility({
                    node,
                    path,
                    treeIndex,
                  })}
              />

              {expanded &&
                !isDragging && (
                  <div
                    style={{ width: scaffoldBlockPxWidth }}
                    className={styles.lineChildren}
                  />
                )}
            </div>
          )}

        <div className={styles.rowWrapper}>
          {/* Set the row preview to be used during drag and drop */}
          {connectDragPreview(
            <div
              className={
                styles.row +
                (isLandingPadActive ? ` ${styles.rowLandingPad}` : '') +
                (isLandingPadActive && !canDrop
                  ? ` ${styles.rowCancelPad}`
                  : '') +
                (isSearchMatch ? ` ${styles.rowSearchMatch}` : '') +
                (isSearchFocus ? ` ${styles.rowSearchFocus}` : '') +
                (className ? ` ${className}` : '')
              }
              style={{
                opacity: isDraggedDescendant ? 0.5 : 1,
                ...style,
              }}
            >
              {handle}

              <div
                className={
                  styles.rowContents +
                  (!canDrag ? ` ${styles.rowContentsDragDisabled}` : '')
                }
              >
                <div className={styles.rowLabel}>
                  <span
                    className={
                      styles.rowTitle +
                      (get(node, 'subtitle') ? ` ${styles.rowTitleWithSubtitle}` : '')
                    }
                  >
                    {typeof nodeTitle === 'function'
                      ? nodeTitle({
                          node,
                          path,
                          treeIndex,
                        })
                      : nodeTitle}
                  </span>

                  {nodeSubtitle && (
                    <span className={styles.rowSubtitle}>
                      {typeof nodeSubtitle === 'function'
                        ? nodeSubtitle({
                            node,
                            path,
                            treeIndex,
                          })
                        : nodeSubtitle}
                    </span>
                  )}
                </div>

                <div className={styles.rowToolbar}>
                  {buttons.map((btn, index) => (
                    <div
                      key={index} // eslint-disable-line react/no-array-index-key
                      className={styles.toolbarButton}
                    >
                      {btn}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

NodeRendererDefault.defaultProps = {
  isSearchMatch: false,
  isSearchFocus: false,
  canDrag: false,
  toggleChildrenVisibility: null,
  buttons: [],
  className: '',
  style: {},
  parentNode: null,
  draggedNode: null,
  canDrop: false,
  title: null,
  subtitle: null,
  dataConfig: dataConfigDefault
};

NodeRendererDefault.propTypes = {
  node: PropTypes.shape({}).isRequired,
  title: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  subtitle: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  path: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  treeIndex: PropTypes.number.isRequired,
  isSearchMatch: PropTypes.bool,
  isSearchFocus: PropTypes.bool,
  canDrag: PropTypes.bool,
  scaffoldBlockPxWidth: PropTypes.number.isRequired,
  toggleChildrenVisibility: PropTypes.func,
  buttons: PropTypes.arrayOf(PropTypes.node),
  className: PropTypes.string,
  style: PropTypes.shape({}),

  // Drag and drop API functions
  // Drag source
  connectDragPreview: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  parentNode: PropTypes.shape({}), // Needed for dndManager
  isDragging: PropTypes.bool.isRequired,
  didDrop: PropTypes.bool.isRequired,
  draggedNode: PropTypes.shape({}),
  // Drop target
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool,
  dataConfig: PropTypes.shape({
    get: PropTypes.func.isRequired,
    set: PropTypes.func.isRequired,
    empty: PropTypes.func.isRequired
  })
};

export default NodeRendererDefault;
